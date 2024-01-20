import React, { useEffect, useState, useCallback } from 'react';
import { StyleProp, ViewStyle, Dimensions, Modal, View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';

interface IService {
    name?: string;
    docker_id?: string;
    docker_image?: string;
    port?: string;
}

interface IProps {
    style?: StyleProp<ViewStyle>;
    service: IService;
    onPress?: ()=>void;
}
 
const CardDocker: React.FC<IProps> = ({
    style,
    service,
    onPress
}) => {

    return(
        <TouchableOpacity onPress={onPress} style={style}>
            <Text><Text style={{fontWeight:'bold'}} children={'Name:'}/> {service.name}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Docker ID:'}/> {service.docker_id}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Docker Image:'}/> {service.docker_image}</Text>
            <Text><Text style={{fontWeight:'bold'}} children={'Port:'}/> {service.port}</Text>
        </TouchableOpacity>
    )

}

export default CardDocker;