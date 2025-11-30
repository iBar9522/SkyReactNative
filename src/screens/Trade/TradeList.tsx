import React from 'react'
import {
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
	View,
	Text,
	StyleSheet,
	Image,
} from 'react-native'
import TradeCard from './TradeCard'
import { useNavigation } from '@react-navigation/native'

const avtoRepoImg = require('@/assets/avtorepo.png')
const valRepoImg = require('@/assets/valrepo.png')

interface Props {
	type: string
	data: any[]
	onItemPress?: (item: any) => void
	onEndReached?: (item: any) => void
	isLoading: boolean
	ref: any
}

const TradeList: React.FC<Props> = ({
	type,
	data,
	onItemPress,
	onEndReached,
	isLoading,
	ref,
}) => {
	const navigation = useNavigation<any>()

	const renderHeader = () => {
		if (type !== 'KASE') return null

		return (
			<View style={styles.repoContainer}>
				<TouchableOpacity
					style={styles.repoCard}
					onPress={() => navigation.navigate('AutoRepoOrder')}
				>
					<Text style={styles.repoTitle}>АвтоРЕПО</Text>
					<Image
						source={avtoRepoImg}
						style={styles.repoImage}
						resizeMode='contain'
					/>
				</TouchableOpacity>

				<TouchableOpacity style={styles.repoCard}>
					<Text style={styles.repoTitle}>Валютное {'\n'}РЕПО</Text>
					<Image
						source={valRepoImg}
						style={styles.repoImage}
						resizeMode='contain'
					/>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<FlatList
			ref={ref}
			data={data}
			keyExtractor={item => item.id.toString()}
			renderItem={({ item }) => (
				<TouchableOpacity onPress={() => onItemPress?.(item)}>
					<TradeCard type={type} item={item} />
				</TouchableOpacity>
			)}
			contentContainerStyle={{ paddingBottom: 80 }}
			ListHeaderComponent={renderHeader}
			onEndReachedThreshold={0.4}
			onEndReached={onEndReached}
			ListFooterComponent={
				isLoading ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
			}
		/>
	)
}

const styles = StyleSheet.create({
	repoContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 16,
		marginBottom: 18,
	},
	repoCard: {
		flex: 1,
		height: 150,
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 16,
		paddingVertical: 20,
		paddingHorizontal: 16,
		position: 'relative',
		overflow: 'hidden',
	},
	repoTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	repoImage: {
		position: 'absolute',
		right: 0,
		bottom: -5,
		width: 130,
		height: 130,
		alignSelf: 'center',
	},
})

export default TradeList
