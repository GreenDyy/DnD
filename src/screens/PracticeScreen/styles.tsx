import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },

  card: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
  },

  info: {
    fontSize: 16,
    marginBottom: 8,
  },

  placeholder: {
    marginTop: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#AAA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
  },

  placeholderSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },

  space: {
    height: 16,
  },

  answerContainer: {
  marginTop: 24,
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 12,
  padding: 16,
},

answerTitle: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 12,
},

answerText: {
  fontSize: 18,
  lineHeight: 28,
  letterSpacing: 1,
},

});