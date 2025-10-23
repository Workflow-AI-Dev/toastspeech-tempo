import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  innerContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  buttonsContainer: {
    padding: 20,
    width: "100%",
  },
  getStartedBtn: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  getStartedText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "black",
  },
  signInBtn: {
    borderWidth: 2,
    borderColor: "white",
    padding: 16,
    borderRadius: 50,
  },
  signInText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
});
