import React, { Component, PropTypes } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';

import Day from './Day';

import moment from 'moment';
import styles from './styles';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class Calendar extends Component {

  state = {
    currentMonthMoment: moment(this.props.minDate),
    selectedMoment: moment(this.props.selectedDate),
    lastX: null,
    dx: null,
  };

  static propTypes = {
    customStyle: PropTypes.object,
    dayHeadings: PropTypes.array,
    maxDate: PropTypes.any.isRequired,
    minDate: PropTypes.any.isRequired,
    monthNames: PropTypes.array,
    nextButtonText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    onDateSelect: PropTypes.func,
    onTouchNext: PropTypes.func,
    onTouchPrev: PropTypes.func,
    onDateChange: PropTypes.func,
    prevButtonText: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    scrollEnabled: PropTypes.bool,
    selectedDate: PropTypes.any,
    showControls: PropTypes.bool,
    showEventIndicators: PropTypes.bool,
    startDate: PropTypes.any,
    titleFormat: PropTypes.string,
    today: PropTypes.any,
    weekStart: PropTypes.number,
    rangeStart: PropTypes.any,
    rangeEnd: PropTypes.any,
  };

  static defaultProps = {
    customStyle: {},
    width: DEVICE_WIDTH,
    dayHeadings: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    nextButtonText: 'Next',
    prevButtonText: 'Prev',
    scrollEnabled: false,
    showControls: false,
    showEventIndicators: false,
    startDate: moment().format('YYYY-MM-DD'),
    titleFormat: 'MMMM YYYY',
    today: moment(),
    weekStart: 1,
    onDateChange: () => {},
  };

  componentDidMount() {
    // fixes initial scrolling bug on Android
    setTimeout(() => this.scrollToItem(0), 0);
    this.props.onDateChange(this.state.currentMonthMoment.toString());
  }

  componentDidUpdate() {

  }

  componentWillReceiveProps(props) {
    if (props.selectedDate) {
      this.setState({selectedMoment: props.selectedDate});
    }
  }

  getMonthStack(currentMonth) {
    const diff = moment(this.props.maxDate).diff(currentMonth, 'month');
    if (this.props.scrollEnabled) {
      const res = [];
      for (let i = 0; i <= diff; i++) {
        res.push(moment(currentMonth).add(i, 'month'));
      }
      return res;
    }
    return [moment(currentMonth)];
  }

  selectDate(date) {
    this.setState({ selectedMoment: date });
    this.props.onDateSelect && this.props.onDateSelect(date ? date.format(): null );
  }

  onPrev = () => {
    const newMoment = moment(this.state.currentMonthMoment).subtract(1, 'month');
    this.setState({ currentMonthMoment: newMoment });
    const diff = Math.abs(moment(this.props.minDate).diff(newMoment, 'month'));
    this.scrollToItem(diff);
    this.props.onDateChange(newMoment);
    this.props.onTouchPrev && this.props.onTouchPrev(newMoment);
  }

  onNext = () => {
    const newMoment = moment(this.state.currentMonthMoment).add(1, 'month');
    const diff = Math.abs(moment(this.props.minDate).diff(newMoment, 'month'));
    this.scrollToItem(diff);
    this.setState({ currentMonthMoment: newMoment });
    this.props.onDateChange(newMoment);
    this.props.onTouchNext && this.props.onTouchNext(newMoment);
  }

  scrollToItem(itemIndex) {
    const scrollToX = itemIndex * this.props.width;
    if (this.props.scrollEnabled) {
      this._calendar.scrollTo({ y: 0, x: scrollToX, animated: false });
    }
  }

  scrollEnded(event) {
    const position = event.nativeEvent.contentOffset.x;
    const currentPage = position / this.props.width;
    const newMoment = moment(this.props.minDate).add(currentPage, 'month');
    this.setState({ currentMonthMoment: newMoment });
    this.props.onDateChange(newMoment);
  }

  renderMonthView(argMoment) {

    let
      renderIndex = 0,
      weekRows = [],
      days = [],
      startOfArgMonthMoment = argMoment.startOf('month');

    const
      selectedMoment = moment(this.state.selectedMoment),
      weekStart = this.props.weekStart,
      todayMoment = moment(this.props.today),
      todayIndex = todayMoment.date() - 1,
      argMonthDaysCount = argMoment.daysInMonth(),
      offset = (startOfArgMonthMoment.isoWeekday() - weekStart + 7) % 7,
      argMonthIsToday = argMoment.isSame(todayMoment, 'month'),
      selectedIndex = moment(selectedMoment).date() - 1,
      selectedMonthIsArg = selectedMoment.isSame(argMoment, 'month');
    do {
      const dayIndex = renderIndex - offset;
      const isoWeekday = (renderIndex + weekStart) % 7;
      const currentMoment = moment(startOfArgMonthMoment).set('date', dayIndex + 1);
      if (dayIndex >= 0 && dayIndex < argMonthDaysCount) {
        days.push((
          <Day
            isRangeStart={currentMoment.isSame(this.props.rangeStart)}
            isRangeEnd={currentMoment.isSame(this.props.rangeEnd)}
            isSelected={this.checkSelection(currentMoment)}
            startOfMonth={startOfArgMonthMoment}
            isWeekend={isoWeekday === 0 || isoWeekday === 6}
            key={`${renderIndex}`}
            onPress={() => {
              this.selectDate(currentMoment);
            }}
            caption={`${dayIndex + 1}`}
            isToday={argMonthIsToday && (dayIndex === todayIndex)}
            customStyle={this.props.customStyle}
            isAvailable={currentMoment.isBetween(this.props.minDate, this.props.maxDate, null, '[]')}
          />
        ));
      } else {
        days.push(<Day key={`${renderIndex}`} filler customStyle={this.props.customStyle} />);
      }
      if (renderIndex % 7 === 6) {
        weekRows.push(
          <View
            key={weekRows.length}
            style={[styles.weekRow, this.props.customStyle.weekRow]}
          >
            {days}
          </View>);
        days = [];
        if (dayIndex + 1 >= argMonthDaysCount) {
          break;
        }
      }
      renderIndex += 1;
    } while (true)
    const containerStyle = [styles.monthContainer, this.props.customStyle.monthContainer];
    return <View key={argMoment.month()} style={containerStyle}>{weekRows}</View>;
  }

  checkSelection = (currentMoment) => {
    const {
      rangeEnd,
      rangeStart
    } = this.props;

    if (rangeStart && rangeEnd) {
      return currentMoment.isBetween(rangeStart, rangeEnd, null, '[]');
    } else {
      return currentMoment.isSame(moment(rangeStart));
    }
  }

  renderHeading() {
    const headings = [];
    for (let i = 0; i < 7; i++) {
      const j = (i + this.props.weekStart) % 7;
      headings.push(
        <Text
          key={i}
          style={j === 0 || j === 6 ?
            [styles.weekendHeading, this.props.customStyle.weekendHeading] :
            [styles.dayHeading, this.props.customStyle.dayHeading]}
        >
          {this.props.dayHeadings[j].toUpperCase()}
        </Text>
      );
    }

    return (
      <View style={[styles.calendarHeading, this.props.customStyle.calendarHeading]}>
        {headings}
      </View>
    );
  }

  renderTopBar() {
    const isAvailablePrev = moment(this.state.currentMonthMoment).subtract(1, 'month')
      .isSameOrAfter(this.props.minDate);
    const isAvailableNext = moment(this.state.currentMonthMoment).add(1, 'month')
      .isSameOrBefore(this.props.maxDate);

    let localizedMonth = this.props.monthNames[this.state.currentMonthMoment.month()];
    return this.props.showControls
    ? (
        <View style={[styles.calendarControls, this.props.customStyle.calendarControls]}>
          <TouchableOpacity
            disabled={!isAvailablePrev}
            style={[styles.controlButton, this.props.customStyle.controlButton]}
            onPress={this.onPrev}
          >
            <Text style={[styles.controlButtonText, this.props.customStyle.controlButtonText, !isAvailablePrev && {opacity: 0}]}>
              {this.props.prevButtonText}
            </Text>
          </TouchableOpacity>
          <View style={{flex: 1}}/>
          <TouchableOpacity
            disabled={!isAvailableNext}
            style={[styles.controlButton, this.props.customStyle.controlButton]}
            onPress={isAvailableNext ? this.onNext : () => {}}
          >
            <Text style={[styles.controlButtonText, this.props.customStyle.controlButtonText, !isAvailableNext && {opacity: 0}]}>
              {this.props.nextButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )
    : (
      <View style={[styles.calendarControls, this.props.customStyle.calendarControls]}>
        <Text style={[styles.title, this.props.customStyle.title]}>
          {this.state.currentMonthMoment.format(this.props.titleFormat)}
        </Text>
      </View>
    );
  }

  render() {
    const calendarDates = this.getMonthStack(this.props.minDate);

    return (
      <View style={[styles.calendarContainer, this.props.customStyle.calendarContainer]}>
        {this.renderTopBar()}
        {this.renderHeading(this.props.titleFormat)}
        {this.props.scrollEnabled ?
          <ScrollView
            ref={calendar => this._calendar = calendar}
            horizontal
            scrollEnabled
            pagingEnabled
            removeClippedSubviews
            scrollEventThrottle={100}
            showsHorizontalScrollIndicator={false}
            automaticallyAdjustContentInsets
            onMomentumScrollEnd={(event) => this.scrollEnded(event)}
          >
            {calendarDates.map((date) => this.renderMonthView(moment(date)))}
          </ScrollView>
          :
          <View ref={calendar => this._calendar = calendar}>
            {calendarDates.map((date) => this.renderMonthView(moment(date)))}
          </View>
        }
      </View>
    );
  }
}
