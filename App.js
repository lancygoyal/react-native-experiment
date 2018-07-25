/**
 * 
 * We would like to do one experiment: We want to load a grid view with 1000 images(2mb to 5mb each).
 * Need to see the loading, scrolling, thumbnail loading performance in React native vs iOS and Android platforms.
 *
 */

import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { RecyclerListView, DataProvider } from "recyclerlistview";
import LayoutUtil from './LayoutUtil';
import Unsplash from 'unsplash-js/native';

const unsplash = new Unsplash({
  applicationId: "5735d1714b6f459d166a3ea3421e79ebae43ba1e9203a5a7c4617cc3d4801e97",
  secret: "a20b2e3490da7927110a738bcec398afd94f0e43ec508fec76357e7ca61868d9",
  callbackUrl: "urn:ietf:wg:oauth:2.0:oob"
});

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }),
      layoutProvider: LayoutUtil.getLayoutProvider(1),
      imageList: [],
      page: 1,
      inProgressNetworkReq: false
    };
  };

  getImageList = async () => {
    let { page, dataProvider, imageList } = this.state;
    this.setState({ inProgressNetworkReq: true });
    let response = await unsplash.photos.listPhotos(page, 20, "popular");
    let { _bodyInit } = response;
    let newList = [...imageList, ...JSON.parse(_bodyInit)];
    this.setState({ inProgressNetworkReq: false, dataProvider: dataProvider.cloneWithRows(newList), imageList: newList, page: page + 1 });
  };

  componentDidMount() {
    this.getImageList();
  };

  renderItem = (type, item) => {
    return (
      <FastImage
        style={styles.itemContainer}
        source={{
          uri: item.urls.full,
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.contain}
        renderAheadOffset={1000}
      />
    );
  };

  renderFooter = () => {
    return this.state.inProgressNetworkReq
      ? <ActivityIndicator
        style={{ margin: 10 }}
      />
      : <View style={{ height: 60 }} />;
  };

  render() {

    const { dataProvider, layoutProvider, imageList } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.headline}>
          Image Count - {imageList.length}
        </Text>
        <RecyclerListView
          style={styles.listView}
          onEndReached={this.getImageList}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          rowRenderer={this.renderItem}
          renderFooter={this.renderFooter}
          renderAheadOffset={1000}
        />
      </View>
    );
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  headline: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  listView: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 5,
    height: 150,
    backgroundColor: 'lightgrey'
  }
});
