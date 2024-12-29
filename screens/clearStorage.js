import AsyncStorage from "@react-native-async-storage/async-storage";

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared.");
    Alert.alert("Success", "All data has been cleared from storage.");
  } catch (error) {
    console.error("Failed to clear AsyncStorage:", error);
    Alert.alert("Error", "Failed to clear the storage.");
  }
};

// Call this function wherever you need to clear storage
clearStorage();
