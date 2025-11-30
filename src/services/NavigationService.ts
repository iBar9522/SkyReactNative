import { createNavigationContainerRef } from '@react-navigation/native'
import type {
	AppNavigatorkParamList,
	RootStackParamList,
} from '../navigation/types'

type CombinedStackParamList = RootStackParamList & AppNavigatorkParamList

export const navigationRef =
	createNavigationContainerRef<CombinedStackParamList>()

export function navigate<RouteName extends keyof CombinedStackParamList>(
	screen: RouteName,
	params?: CombinedStackParamList[RouteName]
): void {
	if (navigationRef.isReady()) {
		navigationRef.navigate(
			...((params ? [screen, params] : [screen]) as unknown as Parameters<
				typeof navigationRef.navigate
			>)
		)
	}
}
