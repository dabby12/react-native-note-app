import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import DraggableFlatList from "react-native-draggable-flatlist";

const NoteEditor = ({ route, navigation }) => {
  const [title, setTitle] = useState("");  // State for the title of the note
  const [note, setNote] = useState("");  // State for the content of the note
  const [tags, setTags] = useState([]);  // State for the tags
  const [newTag, setNewTag] = useState("");  // State for adding a new tag
  const [colors, setColors] = useState({});  // State for tag colors
  const [key, setKey] = useState(route.params?.key || null);  // Key for AsyncStorage

  const defaultColors = [
    "#FFB6C1", "#FFD700", "#87CEFA", "#98FB98", "#FFA07A", "#9370DB", "#FF6347",
    "#4682B4", "#32CD32", "#FFDAB9", "#FF69B4", "#4B0082", "#5F9EA0", "#B22222", "#F0E68C",
  ];

  useEffect(() => {
    const loadNote = async () => {
      if (key) {
        const savedNote = await AsyncStorage.getItem(key);
        if (savedNote) {
          const parsedNote = JSON.parse(savedNote);
          setTitle(parsedNote.title || "");  // Load the title
          setNote(parsedNote.content || "");  // Load the note content
          setTags(parsedNote.tags || []);  // Load the tags
          setColors(parsedNote.colors || {});  // Load the tag colors
        }
      }
    };

    loadNote();
  }, [key]);

  const saveTagsToStorage = async (updatedTags, updatedColors) => {
    try {
      const noteData = { title, content: note, tags: updatedTags, colors: updatedColors };
      await AsyncStorage.setItem(
        key || `note-${Date.now()}`,
        JSON.stringify(noteData)
      );
    } catch (error) {
      console.error("Failed to save tags:", error);
      Alert.alert("Error", "Failed to save tags.");
    }
  };

  const addTag = () => {
    if (!newTag.trim()) {
      Alert.alert("Error", "Tag cannot be empty.");
      return;
    }
    if (tags.find((item) => item.tag === newTag.trim())) {
      Alert.alert("Error", "Tag already exists.");
      return;
    }
    const newColor =
      defaultColors[tags.length % defaultColors.length] || "#D3D3D3";
    const newTagObject = { tag: newTag.trim(), key: `${Date.now()}` };
    const updatedTags = [...tags, newTagObject];
    const updatedColors = { ...colors, [newTag.trim()]: newColor };
    setTags(updatedTags);
    setColors(updatedColors);
    setNewTag("");
    saveTagsToStorage(updatedTags, updatedColors);
  };

  const deleteTag = (tagToDelete) => {
    const updatedTags = tags.filter((item) => item.tag !== tagToDelete);
    const updatedColors = { ...colors };
    delete updatedColors[tagToDelete];
    setTags(updatedTags);
    setColors(updatedColors);
    saveTagsToStorage(updatedTags, updatedColors);
  };

  const handleDoubleTap = (tag) => {
    Alert.alert(
      "Delete Tag",
      `Do you want to delete the tag "${tag}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTag(tag) },
      ]
    );
  };

  const saveNote = async () => {
    try {
      const noteData = { title, content: note, tags, colors };
      await AsyncStorage.setItem(
        key || `note-${Date.now()}`,
        JSON.stringify(noteData)
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save the note.");
      console.error(error);
    }
  };

  const renderTag = ({ item, drag, isActive }) => (
    <TouchableOpacity
      onPress={() => handleDoubleTap(item.tag)}
      onLongPress={drag}
      style={[
        styles.tag,
        {
          backgroundColor: colors[item.tag] || "#D3D3D3",
          opacity: isActive ? 0.8 : 1,
        },
      ]}
    >
      <Text style={styles.tagText}>{item.tag}</Text>
    </TouchableOpacity>
  );

  const handleDragEnd = useCallback(
    ({ data }) => {
      setTags(data);
      saveTagsToStorage(data, colors);
    },
    [colors]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Note Editor</Text>

      {/* Title Input */}
      <TextInput
        style={styles.titleInput}
        placeholder="Enter note title"
        value={title}
        onChangeText={setTitle}
      />

      {/* Note Content Input */}
      <TextInput
        style={styles.noteInput}
        multiline
        placeholder="Write your note here..."
        value={note}
        onChangeText={setNote}
      />

      {/* Tag Input */}
      <TextInput
        style={styles.tagInput}
        placeholder="Add a tag..."
        value={newTag}
        onChangeText={setNewTag}
      />

      <TouchableOpacity onPress={addTag} style={styles.addButton}>
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Tag</Text>
      </TouchableOpacity>

      {/* Tags List */}
      <DraggableFlatList
        data={tags}
        keyExtractor={(item) => item.key}
        renderItem={renderTag}
        onDragEnd={handleDragEnd}
        horizontal={false}
        numColumns={3}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
        <Text style={styles.saveButtonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  titleInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 18,
  },
  noteInput: {
    flex: 1,
    textAlignVertical: "top",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tagInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  tag: {
    padding: 8,
    borderRadius: 8,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default NoteEditor;
