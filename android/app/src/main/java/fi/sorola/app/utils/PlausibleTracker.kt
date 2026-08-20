package fi.sorola.app.utils

import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException

/** Sends anonymous page and event tracking to Plausible for the Android app. */
object PlausibleTracker {
    private val client = OkHttpClient()
    private const val DOMAIN = "app.sorola.fi"
    private const val API_URL = "https://plausible.io/api/event"

    fun trackEvent(eventName: String, path: String) {
        val url = "https://app.sorola.fi/$path"
        val json = "{\"domain\":\"$DOMAIN\",\"name\":\"$eventName\",\"url\":\"$url\"}"
        val body = json.toRequestBody("application/json; charset=utf-8".toMediaType())

        val request = Request.Builder()
            .url(API_URL)
            .post(body)
            .addHeader("User-Agent", "SorolaAndroidApp/1.0")
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                // Tracking failures must never affect app navigation.
            }

            override fun onResponse(call: Call, response: Response) {
                response.close()
            }
        })
    }
}
