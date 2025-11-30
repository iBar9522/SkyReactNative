import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'

export default function PolicyScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<any>>()

	const [activeTab, setActiveTab] = useState<'agreement' | 'privacy'>(
		'agreement'
	)

	const renderContent = () => {
		return (
			<View style={styles.content}>
				{[...Array(6)].map((_, index) => (
					<View key={index} style={styles.section}>
						<Text style={styles.sectionTitle}>
							{index + 1}.{' '}
							{index === 4 || index === 5
								? 'Изменения в соглашении'
								: [
										'Права использования',
										'Обязанности пользователя',
										'Ограничения ответственности',
										'Порядок расторжения',
								  ][index] || 'Раздел'}
						</Text>
						<Text style={styles.sectionText}>
							Integer id arcu suscipit, mollis ligula in, vestibulum arcu.
							Phasellus faucibus, nunc nec interdum condimentum, ex odio luctus
							quam, ut vehicula odio arcu eu tortor.
						</Text>
					</View>
				))}
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#091F44', '#3376F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.overlay} />

			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back' size={24} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Политика</Text>
				<View style={{ width: 24 }} />
			</View>

			<View style={styles.tabContainer}>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'agreement' && styles.activeTab]}
					onPress={() => setActiveTab('agreement')}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === 'agreement' && styles.activeTabText,
						]}
					>
						Соглашения
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
					onPress={() => setActiveTab('privacy')}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === 'privacy' && styles.activeTabText,
						]}
					>
						Конфиденциальность
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				{renderContent()}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		marginTop: 60,
		marginBottom: 16,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontFamily: 'Montserrat',
		fontWeight: 'bold',
	},
	tabContainer: {
		flexDirection: 'row',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		marginHorizontal: 20,
		borderRadius: 20,
		padding: 4,
		marginBottom: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 16,
		alignItems: 'center',
	},
	activeTab: {
		backgroundColor: '#fff',
	},
	tabText: {
		color: '#fff',
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: '500',
	},
	activeTabText: {
		color: '#00244D',
	},
	scroll: {
		paddingHorizontal: 20,
	},
	content: {
		gap: 16,
	},
	section: {},
	sectionTitle: {
		color: '#FAFAFA',
		marginBottom: 4,
		fontSize: 14,
		fontFamily: 'Montserrat',
		fontWeight: 600,
	},
	sectionText: {
		color: '#FAFAFA',
		fontSize: 12,
		fontFamily: 'Montserrat',
		fontWeight: 400,
		lineHeight: 20,
	},
})
