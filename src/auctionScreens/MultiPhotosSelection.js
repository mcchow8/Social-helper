import React from 'react';
import { AssetsSelector } from 'expo-images-picker';
import { Ionicons } from '@expo/vector-icons';
import * as RootNavigation from '../../RootNavigation';

const MultiPhotosSelection = () => {
	return (
		<AssetsSelector
			options={{
				assetsType: ['photo'],
				noAssetsText: 'No media found.',
				maxSelections: 100,
				margin: 1,
				portraitCols: 4,
				landscapeCols: 5,
				widgetWidth: 100,
				widgetBgColor: '#fff',
				selectedBgColor: '#aaa',
				videoIcon: {
					Component: Ionicons,
					iconName: 'ios-videocam',
					color: 'white',
					bg: 'rgba(255, 255, 255, 0.5)',
					size: 20,
				},
				selectedIcon: {
					Component: Ionicons,
					iconName: 'ios-checkmark-circle-outline',
					color: 'rgba(255, 255, 255, 0.6)',
					bg: 'rgba(0, 0, 0, 0.6)',
					size: 30,
				},
				defaultTopNavigator: {
					continueText: '✓   Finish',
					goBackText: '<   Back',
					buttonBgColor: 'dodgerblue',
					buttonTextColor: 'white',
					midTextColor: 'grey',
					backFunction: () => RootNavigation.navigate('Sell'),
					doneFunction: (data) => { RootNavigation.navigate('Sell', { images: data, len: data.length }) },
				},
			}}
		/>
	);
};

export default MultiPhotosSelection;