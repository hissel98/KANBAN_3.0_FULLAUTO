package com.dasistmeinetest.kanban;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    @Override
    protected void load() {
        bridgeBuilder.addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    injectAppCss(webView);
                }
            }
        );

        super.load();
    }

    private void injectAppCss(WebView webView) {
        try {
            String css = readAsset("app-injected.css");
            String js = "var s=document.createElement('style');s.textContent="
                + JSONObject.quote(css)
                + ";document.head.appendChild(s);document.documentElement.classList.add('app-mode');document.body&&document.body.classList.add('app-mode');";

            webView.evaluateJavascript(js, null);
        } catch (IOException ignored) {
            // The app can still run without the optional overlay.
        }
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
