import React, { useState } from 'react';
import { ScrollView, View, Modal, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

interface CustomAlertProps {
    visible: boolean;
    message: string;
    onClose: () => void;
  }

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, message, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} 
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.modalText}>{message}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  scrollView: {
    width: '100%',
    flex: 1, // Make ScrollView flexible
  },
  modalView: {
    width: screenWidth * 0.9, // 60% of screen width
    height: screenHeight*0.6,
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color:'#fff',
    fontSize:14,
  },
  button: {

    borderTopWidth:0.5,
    paddingVertical:10,
    width:'100%',
    alignItems:'center'
    // Style for the close button
  },
  buttonText: {
    // color: '#1a1a1a',
    color:'#fff',
    fontWeight:'900',
    fontSize:20,
    // Other text styles
  },
});

export default CustomAlert;
