package com.tdamiao.jogodavelha

import android.webkit.JavascriptInterface

class TicTacToeWebAppInterface(
    private val onMatchFinished: () -> Unit,
    private val onMatchRestarted: () -> Unit
) {

    @JavascriptInterface
    fun onMatchFinished() {
        onMatchFinished.invoke()
    }

    @JavascriptInterface
    fun onMatchRestarted() {
        onMatchRestarted.invoke()
    }
}
