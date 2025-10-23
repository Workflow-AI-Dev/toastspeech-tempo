import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: height * 0.6,
  },
  imageContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  progressBackground: {
    width: width * 0.8,
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
