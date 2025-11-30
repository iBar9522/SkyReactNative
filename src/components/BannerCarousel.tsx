import React, { useRef } from 'react'
import {
	Dimensions,
	FlatList,
	ImageBackground,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

type Props = { data: any[]; height?: number }

const { width: SCREEN_W } = Dimensions.get('window')
const H_PADDING = 24
const GAP = 12

export default function BannerCarousel({ data, height = 120 }: Props) {
	const flatRef = useRef<FlatList<any>>(null)
	const itemWidth = (SCREEN_W - H_PADDING - GAP) / 2

	return (
		<View style={styles.wrapper}>
			<FlatList
				ref={flatRef}
				data={data}
				keyExtractor={item => item.id}
				horizontal
				showsHorizontalScrollIndicator={false}
				decelerationRate='fast'
				snapToInterval={itemWidth + GAP}
				snapToAlignment='start'
				ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
				getItemLayout={(_, i) => ({
					length: itemWidth + GAP,
					offset: (itemWidth + GAP) * i,
					index: i,
				})}
				renderItem={({ item }) => (
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={item.onPress}
						style={[styles.card, { width: itemWidth, height }]}
					>
						<ImageBackground
							source={item.image}
							style={styles.img}
							resizeMode='cover'
						>
							<View style={styles.overlay}>
								<Text style={styles.title}>{item.title}</Text>
								{!!item.ctaText && (
									<View style={styles.btn}>
										<Text style={styles.btnText}>{item.ctaText}</Text>
									</View>
								)}
							</View>
						</ImageBackground>
					</TouchableOpacity>
				)}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: { marginBottom: 24 },
	card: { borderRadius: 12, overflow: 'hidden' },
	img: { width: '100%', height: '100%' },
	overlay: { position: 'absolute', left: 10, right: 10, bottom: 10 },
	title: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'Montserrat',
		fontWeight: '600',
		marginBottom: 15,
	},
	btn: {
		backgroundColor: '#fff',
		width: 95,
		height: 30,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'flex-start',
	},
	btnText: {
		color: '#000',
		fontSize: 11,
		fontWeight: '600',
		fontFamily: 'Montserrat',
	},
})
