import { StyleSheet } from 'react-native';
import common from './common.style.js';

export default StyleSheet.create({
  firstBtn: {
    ...common.btn,
    backgroundColor: 'blue',
  },
  secondBtn: {
    ...common.btn,
    backgroundColor: 'red',
  },
});
