import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>AisleMarts</Text>
          <Text style={styles.sectionDescription}>
            AI-powered marketplace platform
          </Text>
          <Text style={styles.highlight}>
            Mobile app is ready for development!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#f8f9fa',
  },
  body: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  highlight: {
    fontWeight: '700',
    textAlign: 'center',
    color: '#007bff',
  },
});

export default App;