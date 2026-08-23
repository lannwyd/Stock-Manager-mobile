import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Entypo } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type DropdownItem = { label: string; value: string };

type Props = {
    options: DropdownItem[];
    value?: string;
    onChange: (value: string) => void;
};

const DropdownComponent = ({ options, value, onChange }: Props) => {
    const [isFocus, setIsFocus] = React.useState(false);

    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withTiming(isFocus ? 180 : 0, { duration: 250 });
    }, [isFocus]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

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
                onChange(item.value);
                setIsFocus(false);
            }}
            renderRightIcon={() => null}
            renderLeftIcon={() => (
                <Animated.View style={[styles.icon, animatedIconStyle]}>
                    <Entypo color={isFocus ? 'blue' : 'black'} name="chevron-up" size={20} />
                </Animated.View>
            )}
        />
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    dropdown: { height: 50, paddingHorizontal: 8 },
    icon: { marginRight: 5, justifyContent: 'center', alignItems: 'center' },
    placeholderStyle: { fontSize: 16 },
    selectedTextStyle: { fontSize: 16 },
    iconStyle: { width: 26, height: 26 },
});