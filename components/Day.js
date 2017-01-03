import React, { Component, PropTypes } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import styles from './styles';

export default class Day extends Component {
  static defaultProps = {
    customStyle: {},
  }

  static propTypes = {
    caption: PropTypes.any,
    customStyle: PropTypes.object,
    filler: PropTypes.bool,
    isSelected: PropTypes.bool,
    isToday: PropTypes.bool,
    isWeekend: PropTypes.bool,
    onPress: PropTypes.func,
    isAvailable: PropTypes.bool,
    isRangeStart: PropTypes.bool,
    isRangeEnd: PropTypes.bool,
    selected: PropTypes.bool,
  }

  dayCircleStyle = (isWeekend, isSelected, isToday, isRangeEnd, isRangeStart) => {
    const { customStyle } = this.props;
    const dayCircleStyle = [customStyle.dayCircleFiller];

    if (isSelected && isRangeEnd && isRangeStart) {
      dayCircleStyle.push(customStyle.selectedDayCircle);
    } else if (isSelected && isRangeStart) {
      dayCircleStyle.push(customStyle.selectedDayCircleStart);
    } else if (isSelected && isRangeEnd) {
      dayCircleStyle.push(customStyle.selectedDayCircleEnd);
    } else if (isSelected) {
      dayCircleStyle.push(customStyle.selectedDayInRange);
    } else if (isToday) {
      dayCircleStyle.push(customStyle.todayCircle);
    }

    return dayCircleStyle;
  }

  dayTextStyle = (isWeekend, isSelected, isToday, isAvailable) => {
    const { customStyle } = this.props;
    const dayTextStyle = [styles.day, customStyle.day];

    if (!isAvailable) {
      dayTextStyle.push(styles.weekendDayText, customStyle.unavailableText);
    } else if (isToday && !isSelected) {
      dayTextStyle.push(styles.currentDayText, customStyle.currentDayText);
    } else if (isToday || isSelected) {
      dayTextStyle.push(styles.selectedDayText, customStyle.selectedDayText);
    }

    return dayTextStyle;
  }

  render() {
    let { caption, customStyle } = this.props;
    const {
      filler,
      isWeekend,
      isSelected,
      isToday,
      isAvailable,
      isRangeEnd,
      isRangeStart,
    } = this.props;

    return filler
    ? (
        <View>
          <View style={[styles.dayButtonFiller, customStyle.dayButtonFiller]}>
            <Text style={[styles.day, customStyle.day]} />
          </View>
        </View>
      )
    : (
      <TouchableOpacity onPress={this.props.onPress} activeOpacity={0.9} disabled={!isAvailable}>
        <View style={[styles.dayButton, customStyle.dayButton]}>
          <View style={this.dayCircleStyle(isWeekend, isSelected, isToday, isRangeEnd, isRangeStart)}>
            <Text style={this.dayTextStyle(isWeekend, isSelected, isToday, isAvailable)}>{caption}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
