import axios from "axios";

export const createTextToSpeak = async (req, res) => {
  try {
    const { text, voiceId='NOpBlnGInO9m6vDvFkFC' } = req.body;

    // Validate input
    if (!text || !voiceId) {
      return res.status(400).json({ success: false, message: "Text and voiceId are required" });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v1",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    )

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `inline; filename=${voiceId}.mp3`,
    })

    res.send(response.data);
  } catch (error) {
    console.error("Error in create text to speak: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}