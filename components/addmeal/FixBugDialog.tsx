import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, Appearance, View } from "react-native";
import Dialog from "react-native-dialog";

const LongTextInputDialog = ({ visible, onClose, onSubmit }) => {
  const [text, setText] = useState("");
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const [contentHeight, setContentHeight] = useState(0);
  const lineHeight = 20; // Approximate height of one line

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const isDarkTheme = theme === "dark";

  const handleTextChange = (newText) => {
    setText(newText);
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
            isDarkTheme ? styles.inputDark : styles.inputLight,
          ]}
          onChangeText={handleTextChange}
          onContentSizeChange={handleContentSizeChange}
          value={text}
          multiline
          numberOfLines={5}
          placeholderTextColor={isDarkTheme ? "#ccc" : "#666"}
        />
      </View>
      <Dialog.Button label="Cancel" onPress={onClose} />
      <Dialog.Button label="Submit" onPress={() => onSubmit(text)} />
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
