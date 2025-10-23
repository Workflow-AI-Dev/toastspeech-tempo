import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5FF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 30,
    tintColor: "#8B5CF6",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 15,
    color: "#3B82F6",
    textAlign: "center",
  },
  message: {
    fontSize: 17,
    color: "#0284C7",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#000000ff",
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  hintText: {
    fontSize: 14,
    color: "#F59E0B",
    textAlign: "center",
    marginTop: 15,
  },
});
