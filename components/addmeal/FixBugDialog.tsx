import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, Appearance, View } from "react-native";
import Dialog from "react-native-dialog";

const LongTextInputDialog = ({ visible, onClose, onSubmit }) => {
  const [text, setText] = useState("");
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const [contentHeight, setContentHeight] = useState(0);
  const lineHeight = 20;

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const handleSubmit = () => {
    if (!text || !text.trim()) {
      console.warn("Feedback text is empty");
      return;
    }

    const cleanText = text.trim();
    console.log("Submitting feedback:", cleanText);

    try {
      onSubmit(cleanText);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleTextChange = (newText: string) => {
    const sanitizedText = newText.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    setText(sanitizedText);
  };

  const handleContentSizeChange = (event) => {
    setContentHeight(event.nativeEvent.contentSize.height);
  };

  const numberOfLines = Math.ceil(contentHeight / lineHeight);
  const dynamicMargin = (numberOfLines - 1) * lineHeight;

  return (
    <Dialog.Container
      visible={visible}
      onBackdropPress={onClose}
      contentStyle={{ marginBottom: dynamicMargin }}
    >
      <Dialog.Title>Describe what's wrong</Dialog.Title>
      <View style={styles.descriptionContainer}>
        <TextInput
          style={[
            styles.input,
            theme === "dark" ? styles.inputDark : styles.inputLight,
          ]}
          onChangeText={handleTextChange}
          onContentSizeChange={handleContentSizeChange}
          value={text}
          multiline
          numberOfLines={5}
          placeholderTextColor={theme === "dark" ? "#ccc" : "#666"}
          placeholder="Please describe the issue..."
        />
      </View>
      <Dialog.Button label="Cancel" onPress={onClose} />
      <Dialog.Button
        label="Submit"
        onPress={handleSubmit}
        disabled={!text.trim()}
      />
    </Dialog.Container>
  );
};

const styles = StyleSheet.create({
  descriptionContainer: {
    marginVertical: 15,
    paddingHorizontal: 15,
    marginTop: -4,
  },
  input: {
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
  },
  inputLight: {
    borderColor: "#ccc",
    borderWidth: 1,
    color: "black",
  },
  inputDark: {
    borderColor: "#555",
    borderWidth: 1,
    color: "white",
  },
});

export default LongTextInputDialog;
