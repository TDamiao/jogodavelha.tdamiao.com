package com.tdamiao.jogodavelha

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.AdError

class MonetizationViewModel : ViewModel() {

    private val _shouldShowInterstitial = MutableLiveData(false)
    val shouldShowInterstitial: LiveData<Boolean> = _shouldShowInterstitial

    private val _shouldPrepareNewMatch = MutableLiveData(false)
    val shouldPrepareNewMatch: LiveData<Boolean> = _shouldPrepareNewMatch

    val fullScreenContentCallback = object : FullScreenContentCallback() {
        override fun onAdDismissedFullScreenContent() {
            _shouldShowInterstitial.value = false
            _shouldPrepareNewMatch.value = true
        }

        override fun onAdFailedToShowFullScreenContent(adError: AdError) {
            _shouldShowInterstitial.value = false
            _shouldPrepareNewMatch.value = true
        }
    }

    fun onMatchFinished() {
        _shouldShowInterstitial.postValue(true)
    }

    fun onMatchRestarted() {
        _shouldPrepareNewMatch.postValue(true)
    }

    fun onInterstitialPrepared() {
        _shouldPrepareNewMatch.value = false
    }
}
