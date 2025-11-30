import React, { useMemo, useRef, useState } from 'react'
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Image,
	ViewStyle,
	FlatList,
} from 'react-native'

export type Option<T extends string | number> = {
	value: T
	label: string
}

export type SelectProps<T extends string | number> = {
	value: T | null | undefined
	options: Array<Option<T>>
	onSelect: (value: T) => void
	placeholder?: string
	skipFirstOptionInDropdown?: boolean
	dropdownStyle?: ViewStyle
	listMaxHeight?: number
}

function Select<T extends string | number>({
	value,
	options,
	onSelect,
	placeholder,
	skipFirstOptionInDropdown = false,
	dropdownStyle,
	listMaxHeight = 280,
}: SelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false)
	const rotateValue = useRef(new Animated.Value(0)).current

	const handleSelect = (optionValue: T) => {
		onSelect(optionValue)
		setIsOpen(false)
		animateChevron(false)
	}

	const toggleDropdown = () => {
		const next = !isOpen
		setIsOpen(next)
		animateChevron(next)
	}

	const animateChevron = (open: boolean) => {
		Animated.timing(rotateValue, {
			toValue: open ? 1 : 0,
			duration: 200,
			useNativeDriver: true,
		}).start()
	}

	const selectedOption = useMemo(
		() => options.find(opt => opt.value === value),
		[options, value]
	)

	const dropdownOptions = useMemo(() => {
		if (skipFirstOptionInDropdown && value !== null && value !== undefined) {
			return options.filter(option => option.value !== value)
		}
		return options
	}, [options, value, skipFirstOptionInDropdown])

	const rotate = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '180deg'],
	})

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={toggleDropdown}
				style={styles.selectButton}
				activeOpacity={0.8}
			>
				<Text style={styles.selectText}>
					{selectedOption ? selectedOption.label : placeholder || 'Select...'}
				</Text>

				<Animated.View
					style={[styles.chevronWrapper, { transform: [{ rotate }] }]}
				>
					<Image
						source={require('@/assets/dropdown.png')}
						style={styles.dropdownIcon}
					/>
				</Animated.View>
			</TouchableOpacity>

			{isOpen && (
				<View
					style={[styles.dropdown, { maxHeight: listMaxHeight }, dropdownStyle]}
				>
					<FlatList
						data={dropdownOptions}
						keyExtractor={item => String(item.value)}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => handleSelect(item.value)}
								style={styles.optionButton}
								activeOpacity={0.7}
							>
								<Text style={styles.optionText}>{item.label}</Text>
							</TouchableOpacity>
						)}
						nestedScrollEnabled
						keyboardShouldPersistTaps='handled'
					/>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: { position: 'relative' },
	selectButton: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	dropdownIcon: { width: 12, height: 6 },
	selectText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '500',
		flex: 1,
		textAlign: 'left',
	},
	chevronWrapper: { marginLeft: 8 },
	dropdown: {
		position: 'absolute',
		top: '100%',
		left: 0,
		right: 0,
		marginTop: 4,
		backgroundColor: '#284372',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 8,
		zIndex: 10,
		overflow: 'hidden',
	},
	optionButton: { paddingHorizontal: 16, paddingVertical: 12 },
	optionText: { color: '#ffffff', fontSize: 14, textAlign: 'left' },
})

export default Select
