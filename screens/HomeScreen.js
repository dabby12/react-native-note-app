import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all notes from AsyncStorage
  const loadNotes = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      const storedNotes = values.map(([key, value]) => ({
        key,
        value: JSON.parse(value),
      }));
      setNotes(storedNotes);
      setFilteredNotes(storedNotes); // Initialize filtered notes
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  // Delete a note
  const deleteNote = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      setNotes((prev) => prev.filter((note) => note.key !== key));
      setFilteredNotes((prev) => prev.filter((note) => note.key !== key));
      Alert.alert("Success", "Note deleted successfully!");
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Handle long press
  const handleLongPress = (key) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteNote(key) },
      ]
    );
  };

  // Search functionality to filter notes by title, description, or tags
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(
        notes.filter((note) => {
          const queryLower = query.toLowerCase();
          const titleMatch = note.value.title?.toLowerCase().includes(queryLower);
          const descriptionMatch = note.value.description?.toLowerCase().includes(queryLower);
          const tagsMatch = note.value.tags?.some((tag) =>
            tag.tag.toLowerCase().includes(queryLower)
          );
          return titleMatch || descriptionMatch || tagsMatch;
        })
      );
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadNotes);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Notes</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title, description, or tags"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() =>
              navigation.navigate("NoteEditor", { key: item.key })
            }
            onLongPress={() => handleLongPress(item.key)}
          >
            <Text style={styles.noteTitle}>{item.value.title || "Untitled"}</Text>
            <Text>{item.value.description}</Text>
            {/* Display tags properly */}
            <Text>
              Tags:{" "}
              {item.value.tags?.map((tag) => tag.tag).join(", ") || "No tags"}
            </Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Create a New Note" onPress={() => navigation.navigate("NoteEditor")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  noteCard: {
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  noteTitle: { fontWeight: "bold", fontSize: 16 },
});

export default HomeScreen;
