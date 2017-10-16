import React, { Component, PropTypes } from 'react'

import {
  View,
  ScrollView,
  ViewPagerAndroid,
  Platform,
  Dimensions,
} from 'react-native'

import styles from './styles'

const deviceWidth = Dimensions.get('window').width

class ViewPager extends Component {
  state = {
    width: 0,
    height: 0,
    selectedIndex: this.props.selectedIndex,
    initialSelectedIndex: this.props.selectedIndex,
    scrollingTo: null,
  }

  render() {
    if (Platform.OS === 'ios') {
      return this.renderIOS()
    }

    return this.renderAndroid()
  }

  renderIOS() {
    return (
      <ScrollView
        ref={ref => (this.scrollview = ref)}
        contentOffset={{
          x: this.state.width * this.state.initialSelectedIndex,
          y: 0,
        }}
        style={[styles.scrollview, this.props.style]}
        horizontal
        pagingEnabled
        bounces={!!this.props.bounces}
        scrollsToTop={false}
        onScroll={this.handleHorizontalScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        automaticallyAdjustContentInsets={false}
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLayout={this.adjustCardSize}
      >
        { this.renderContent() }
      </ScrollView>
    )
  }

  renderAndroid() {
    return (
      <ViewPagerAndroid
        ref={ref => (this.scrollview = ref)}
        initialPage={this.state.initialSelectedIndex}
        onPageSelected={this.handleHorizontalScroll}
        onPageScroll={this.handleHorizontalScrollAndroid}
        style={styles.container}
      >
        { this.renderContent() }
      </ViewPagerAndroid>
    )
  }

  adjustCardSize = e => {
    this.setState({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedIndex !== this.state.selectedIndex) {
      if (Platform.OS === 'ios') {
        this.scrollview.scrollTo({
          x: nextProps.selectedIndex * this.state.width,
          animated: this.props.animated === undefined ? true : this.props.animated,
        })
        this.setState({ scrollingTo: nextProps.selectedIndex })
      } else {
        if (this.props.animated) {
          this.scrollview.setPage(nextProps.selectedIndex)
        } else {
          this.scrollview.setPageWithoutAnimation(nextProps.selectedIndex)
        }

        this.setState({ selectedIndex: nextProps.selectedIndex })
      }
    }
  }

  renderContent = () => {
    const { width, height } = this.state
    const style = Platform.OS === 'ios' && styles.card

    return React.Children.map(this.props.children, (child, i) => (
      <View style={[style, { width, height }]} key={`r_${i}`}>
        {child}
      </View>
    ))
  }

  handleHorizontalScroll = e => {
    let selectedIndex = e.nativeEvent.position
    let floatIndex = selectedIndex

    if (Platform.OS === 'ios') {
      floatIndex = e.nativeEvent.contentOffset.x / this.state.width

      if (this.props.onScroll) {
        this.props.onScroll(e.nativeEvent.contentOffset.x)
      }
    }

    if (selectedIndex === undefined) {
      selectedIndex = floatIndex | 0
    }

    if (selectedIndex < 0 || selectedIndex >= this.props.count) {
      return
    }

    if (this.state.scrollingTo !== null && this.state.scrollingTo !== selectedIndex) {
      return
    }

    if ((floatIndex | 0) === floatIndex &&
        (this.props.selectedIndex !== selectedIndex ||
        this.state.scrollingTo !== null)) {
      this.setState({ selectedIndex, scrollingTo: null }, () => {
        const { onSelectedIndexChange } = this.props
        if (onSelectedIndexChange) {
          onSelectedIndexChange(selectedIndex)
        }
      })
    }
  }

  handleHorizontalScrollAndroid = e => {
    if (this.props.onScroll) {
      this.props.onScroll((e.nativeEvent.offset + e.nativeEvent.position) * deviceWidth)
    }
  }
}

module.exports = ViewPager
