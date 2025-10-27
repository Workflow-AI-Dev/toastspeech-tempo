import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import MovToMp4 from "react-native-mov-to-mp4";
import { Video as VideoCompressor } from "react-native-compressor";

const MovProcessorTest = () => {
  const [status, setStatus] = useState<string>("Idle");
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const ensureFilePath = async (uri: string): Promise<string> => {
    if (uri.startsWith("content://")) {
      console.log("⚠️ Got content:// URI, copying to cache...");
      const destPath = FileSystem.cacheDirectory + "upload_" + Date.now();
      await FileSystem.copyAsync({ from: uri, to: destPath });
      return destPath;
    }
    return uri;
  };

  const compressVideo = async (uri: string): Promise<string> => {
    try {
      setStatus("Compressing...");
      const safeUri = await ensureFilePath(uri);

      const result = await VideoCompressor.compress(
        safeUri,
        {
          compressionMethod: "manual",
          bitrate: 800,
          maxSize: 360,
        },
        (progressValue) => {
          setProgress(Math.round(progressValue * 100));
        },
      );

      const compressedUri = result.startsWith("file://")
        ? result
        : `file://${result}`;
      const info = await FileSystem.getInfoAsync(compressedUri);
      console.log(
        `🎯 Final compressed size: ${(info.size / (1024 * 1024)).toFixed(2)} MB`,
      );
      return compressedUri;
    } catch (err) {
      console.error("❌ Compression error:", err);
      return uri;
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/mp4", "video/mov", "video/quicktime"],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const fileUri = file.uri;
      const fileName = file.name.toLowerCase();
      const safeUri = await ensureFilePath(fileUri);

      setStatus("Processing...");
      console.log("📂 Selected file:", fileName);

      let processedUri = safeUri;

      // Convert MOV to MP4 if needed
      if (fileName.endsWith(".mov")) {
        try {
          setStatus("Converting MOV → MP4...");
          const converted = await MovToMp4.convertMovToMp4(
            safeUri.replace("file://", ""),
            `${Date.now()}.mp4`,
          );
          processedUri = converted.startsWith("file://")
            ? converted
            : `file://${converted}`;
          console.log("✅ MOV successfully converted:", processedUri);
        } catch (convErr) {
          console.error("❌ MOV conversion failed:", convErr);
          Alert.alert("Conversion failed", "Couldn't convert MOV to MP4.");
        }
      }

      // Compress after conversion
      const finalUri = await compressVideo(processedUri);
      setConvertedFile(finalUri);

      const finalInfo = await FileSystem.getInfoAsync(finalUri);
      console.log("📦 Final file info:", finalInfo);

      setStatus(`✅ Done (${(finalInfo.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong while processing your file.");
      setStatus("Error");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text style={{ color: "white", fontSize: 18, marginBottom: 20 }}>
        🎬 MOV → MP4 Test Utility
      </Text>

      <TouchableOpacity
        onPress={handleSelectFile}
        style={{
          backgroundColor: "#6C63FF",
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Pick & Process File
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Text style={{ color: "#ccc", fontSize: 16 }}>{status}</Text>
        {status.includes("Compressing") && (
          <>
            <ActivityIndicator color="#6C63FF" style={{ marginTop: 10 }} />
            <Text style={{ color: "#6C63FF", marginTop: 8 }}>{progress}%</Text>
          </>
        )}
      </View>

      {convertedFile && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ color: "#4CAF50" }}>✅ Processed File Path:</Text>
          <Text
            selectable
            style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}
          >
            {convertedFile}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MovProcessorTest;
