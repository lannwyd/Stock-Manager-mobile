import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Entypo } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const DropdownComponent = ({ options }: any) => {
    const [value, setValue] = useState("pharmacie")
    const [isFocus, setIsFocus] = useState(false);

    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withTiming(isFocus ? 180 : 0, { duration: 250 });
    }, [isFocus]);

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    return (
        <Dropdown
        
            style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={options}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={value}
            mode="default"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
                setValue(item.value);
                setIsFocus(false);
            }}
            renderRightIcon={() => null}
            renderLeftIcon={() => (
                <Animated.View style={[styles.icon, animatedIconStyle]}>
                    <Entypo
                        color={isFocus ? 'blue' : 'black'}
                        name="chevron-up" 
                        size={20}
                    />
                </Animated.View>
            )}
        />
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    dropdown: {
        width:'100%',
        height: 50,
    },
    icon: {
        marginRight: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width : 26,
        height : 26
    },

});
