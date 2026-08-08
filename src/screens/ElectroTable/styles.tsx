import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7F0FF',
  },

  flex: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },

  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#102A43',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },

  fieldGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#0F172A',
  },

  modeContainer: {
    flexDirection: 'row',
  },

  modeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CFD8E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 10,
  },

  modeButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  modeText: {
    fontWeight: '600',
    color: '#334155',
  },

  modeTextActive: {
    color: '#FFFFFF',
  },

  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  speedControl: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8FAFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  speedControlText: {
    fontSize: 28,
    color: '#2563EB',
    fontWeight: '700',
  },

  speedValueBox: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },

  speedValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102A43',
  },

  speedLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },

  generateButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 10},
    elevation: 5,
  },

  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});