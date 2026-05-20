package com.dasistmeinetest.kanban;

import android.net.Uri;
import android.util.Log;
import android.webkit.WebView;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final String INJECTED_STYLE_ID = "capacitor-app-injected-css";

    @Override
    protected void load() {
        WebView webView = findViewById(com.getcapacitor.android.R.id.webview);
        installDocumentStartInjection(webView);

        bridgeBuilder.addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    injectAppCss(webView);
                }

                @Override
                public void onPageCommitVisible(WebView webView, String url) {
                    injectAppCss(webView);
                }
            }
        );

        super.load();

        injectAppCss(bridge.getWebView());
    }

    private void injectAppCss(WebView webView) {
        if (webView == null) {
            return;
        }

        try {
            webView.evaluateJavascript(buildInjectionScript(), result -> Log.d(TAG, "CSS injection result: " + result));
        } catch (IOException e) {
            Log.w(TAG, "Unable to read injected CSS asset", e);
        }
    }

    private void installDocumentStartInjection(WebView webView) {
        if (webView == null) {
            Log.w(TAG, "Unable to install document-start CSS injection; WebView is not available");
            return;
        }

        if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            Log.d(TAG, "DOCUMENT_START_SCRIPT is not supported; using page lifecycle fallback");
            return;
        }

        try {
            String origin = getConfiguredServerOrigin();
            WebViewCompat.addDocumentStartJavaScript(webView, buildInjectionScript(), Collections.singleton(origin));
            Log.d(TAG, "Installed document-start CSS injection for " + origin);
        } catch (Exception e) {
            Log.w(TAG, "Unable to install document-start CSS injection", e);
        }
    }

    private String getConfiguredServerOrigin() throws Exception {
        JSONObject config = new JSONObject(readAsset("capacitor.config.json"));
        String serverUrl = config.getJSONObject("server").getString("url");
        Uri serverUri = Uri.parse(serverUrl);
        return serverUri.getScheme() + "://" + serverUri.getAuthority();
    }

    private String buildInjectionScript() throws IOException {
        String css = readAsset("app-injected.css");
        String cssLiteral = JSONObject.quote(css);
        String idLiteral = JSONObject.quote(INJECTED_STYLE_ID);

        return "(function(){"
            + "var css=" + cssLiteral + ";"
            + "var id=" + idLiteral + ";"
            + "function apply(){"
            + "try{"
            + "var root=document.documentElement;"
            + "if(root){root.classList.add('app-mode');}"
            + "if(document.body){document.body.classList.add('app-mode');}"
            + "var parent=document.head||document.documentElement;"
            + "if(!parent){return false;}"
            + "var style=document.getElementById(id);"
            + "if(!style){style=document.createElement('style');style.id=id;style.type='text/css';parent.appendChild(style);}"
            + "if(style.textContent!==css){style.textContent=css;}"
            + "return !!(root&&document.getElementById(id));"
            + "}catch(e){return false;}"
            + "}"
            + "if(apply()){return 'injected';}"
            + "var tries=0;"
            + "var timer=setInterval(function(){tries++;if(apply()||tries>60){clearInterval(timer);}},50);"
            + "document.addEventListener('DOMContentLoaded',apply,{once:true});"
            + "return 'scheduled';"
            + "})();";
    }

    private String readAsset(String fileName) throws IOException {
        try (InputStream inputStream = getAssets().open(fileName); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }

            return outputStream.toString(StandardCharsets.UTF_8.name());
        }
    }
}
