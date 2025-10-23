import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  upgradeButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    elevation: 2,
  },
  upgradeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
