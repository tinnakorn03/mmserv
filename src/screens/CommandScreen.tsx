import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getToken, clearToken } from '../utils/authUtils'; 
import { useNavigation } from '@react-navigation/native';

interface IProps {
   
}
 
const CommandScreen: React.FC<IProps> = ({
 
}) => {
    const [command, setCommand] = useState('');
    const [commandResults, setCommandResults] = useState<any>([]); // ใช้ array สำหรับเก็บรายการผลลัพธ์
    const [currentDirectory, setCurrentDirectory] = useState<string>();
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null); 

    useEffect(() => {
        if (commandResults.length > 0) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [commandResults]);

    const handleExecuteCommand = async () => {
      const userToken = await getToken();
      try {
        const response = await fetch('https://hubapi-manage-serv.hubexpress.co/executeCommand', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command }),
        });
  
        if (response.ok) {
            setCommand('');
            const result = await response.json(); 
            setCurrentDirectory(result.current_directory)
            setCommandResults((prevResults:any) => { 
                const newResults = [...prevResults,  result.data ]; 
                return newResults.slice(-4);
            }); // เพิ่มผลลัพธ์ใหม่เข้าไปในรายการ  
        } else {
          Alert.alert('Error', 'Failed to execute command.');
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        Alert.alert('Error', 'An error occurred while executing the command.');
      }
    };

    return( 
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}> 
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
                    <Text style={styles.buttonText}>{'_<'}</Text> 
                </TouchableOpacity>

                <ScrollView  ref={scrollViewRef} style={styles.resultContainer}>
                {commandResults.map((result:any, index:number) => (
                    <Text key={index} style={styles.resultText}>
                        <Text style={{fontWeight:'600',color:'green'}} children={'['}/> 
                        <Text style={{fontWeight:'600',color:'red'}} children={'root'}/>
                        <Text style={{fontWeight:'600',color:'yellow'}} children={'@'}/>
                        <Text style={{fontWeight:'600',color:'green'}} children={'ChCorporate'}/> 
                        <Text style={{fontWeight:'600',color:'white'}} children={':'}/>  
                        <Text style={{fontWeight:'600',color:'#49c7cf'}} children={currentDirectory}/> 
                        <Text style={{fontWeight:'600',color:'green'}} children={']'}/>
                        <Text style={{fontWeight:'600',color:'#49c7cf'}} children={'# '}/>
                        {result}
                    </Text>
                ))}
                </ScrollView>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.commandInput}
                        placeholder="Enter command"
                        placeholderTextColor="#ccc"
                        value={command}
                        onChangeText={setCommand}
                        autoCapitalize="none"
                        autoCorrect={false}
                    /> 
                    <View style={styles.executeButton}>
                        <TouchableOpacity onPress={handleExecuteCommand} style={styles.button}>
                            <Text style={styles.executeButtonText}>Execute</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

        </KeyboardAvoidingView>
    )

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
    },
    goBackButton: {
      margin: 10,
      padding: 10,
    },
    goBackButtonText: {
      color: 'white',
    },
    backButton: {
        // position: 'absolute',
        top: 10,
        left: 10,
        width: 40,
        height: 40,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center', 
        margin: 2,
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        fontWeight:'700',
        // top:-2, 
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', 
        width:'100%',
        paddingBottom:25
    },
    commandInput: {
      color: 'whitesmoke',
      borderColor: 'gray',
      borderWidth: 0.5, 
      padding: 10,
      width:'80%',
      borderRadius:10,
    },
    button: {
        backgroundColor: 'blue', 
        paddingVertical: 8,
        alignItems: 'center',
        width:'100%',
        borderRadius:10,

    },
    executeButton: {
      padding: 10,
      alignItems: 'center',
      width:'20%', 
    },
    executeButtonText: {
      color: 'white',
    },
    resultContainer: {
      flex: 1,
      margin: 10,
    },
    resultText: {
      color: 'white',
    },
  });

export default CommandScreen;