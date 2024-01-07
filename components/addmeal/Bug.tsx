import React from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
} from "react-native";

import { styles } from "./styles";

const Bug = ({ openComment, response  } : {
    openComment : () => void,
    response : string | undefined
}) => {
  const colorScheme = useColorScheme();
  const message = response ? response : "An unexpected error occured";

  return (
    <>
      <Text style={styles(colorScheme).resultTitle}>Uh oh</Text>
      <TouchableOpacity
        style={styles(colorScheme).secondaryButton}
        onPress={openComment}
      >
        <Text style={styles(colorScheme).secondaryButtonText}>
          Retry with a comment
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles(colorScheme).mainButton}
        onPress={() => {}}
      >
        <Text style={styles(colorScheme).mainButtonText}>Close</Text>
      </TouchableOpacity>
    </>
  );
};

export default Bug;
