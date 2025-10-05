package com.tdamiao.jogodavelha

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.viewModels
import androidx.core.view.WindowCompat
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.InterstitialAd
import com.google.android.gms.ads.InterstitialAdLoadCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.tdamiao.jogodavelha.databinding.ActivityMainBinding

class MainActivity : ComponentActivity() {

    private lateinit var binding: ActivityMainBinding
    private var interstitialAd: InterstitialAd? = null

    private val adViewModel: MonetizationViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        MobileAds.initialize(this)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView(binding.webView)
        setupBanner(binding.adView)
        observeAdRequests()
    }

    private fun observeAdRequests() {
        adViewModel.shouldShowInterstitial.observe(this) { shouldShow ->
            if (shouldShow) {
                showInterstitial()
            }
        }

        adViewModel.shouldPrepareNewMatch.observe(this) { shouldPrepare ->
            if (shouldPrepare) {
                loadInterstitial()
                adViewModel.onInterstitialPrepared()
            }
        }
    }

    private fun setupBanner(adView: AdView) {
        val request = AdRequest.Builder().build()
        adView.loadAd(request)
    }

    private fun loadInterstitial() {
        val request = AdRequest.Builder().build()
        InterstitialAd.load(
            this,
            getString(R.string.admob_interstitial_unit_id),
            request,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    interstitialAd = null
                }
            }
        )
    }

    private fun showInterstitial() {
        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = adViewModel.fullScreenContentCallback
            ad.show(this)
            interstitialAd = null
        } else {
            loadInterstitial()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView(webView: WebView) {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true
        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(
            TicTacToeWebAppInterface(
                onMatchFinished = { adViewModel.onMatchFinished() },
                onMatchRestarted = { adViewModel.onMatchRestarted() }
            ),
            "Android"
        )

        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        webView.loadUrl("file:///android_asset/web/index.html")
        loadInterstitial()
    }
}
