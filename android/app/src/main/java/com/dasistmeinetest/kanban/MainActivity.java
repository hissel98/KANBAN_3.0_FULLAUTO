package com.dasistmeinetest.kanban;

import android.util.Base64;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final String CSS_ASSET = "app-injected.css";
    private static final String CSS_LINK_ID = "capacitor-app-injected-css";

    @Override
    protected void load() {
        bridgeBuilder.addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    injectCss(webView);
                }
            }
        );

        super.load();
    }

    private void injectCss(WebView webView) {
        if (webView == null) {
            return;
        }

        try {
            webView.evaluateJavascript(buildInjectionScript(), result -> Log.d(TAG, "CSS injection result: " + result));
        } catch (IOException e) {
            Log.w(TAG, "Unable to read CSS asset", e);
        }
    }

    private String buildInjectionScript() throws IOException {
        String cssDataUri = "data:text/css;base64," + Base64.encodeToString(readAssetBytes(CSS_ASSET), Base64.NO_WRAP);

        return "(function(){"
            + "var id='" + CSS_LINK_ID + "';"
            + "var href='" + cssDataUri + "';"
            + "document.documentElement.classList.add('app-mode');"
            + "if(document.body){document.body.classList.add('app-mode');}"
            + "var parent=document.head||document.documentElement;"
            + "if(!parent){return 'no-parent';}"
            + "var link=document.getElementById(id);"
            + "if(!link){"
            + "link=document.createElement('link');"
            + "link.id=id;"
            + "link.rel='stylesheet';"
            + "link.type='text/css';"
            + "parent.appendChild(link);"
            + "}"
            + "if(link.href!==href){link.href=href;}"
            + "return 'injected';"
            + "})();";
    }

    private byte[] readAssetBytes(String fileName) throws IOException {
        try (InputStream inputStream = getAssets().open(fileName); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int bytesRead;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }

            return outputStream.toByteArray();
        }
    }
}
