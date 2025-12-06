import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B4332', // 다크 그린
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#1B4332',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#081C15',
    backgroundColor: '#F8F9FA',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#1B4332', // 다크 그린
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkBtn: {
    width: '100%',
    alignItems: 'center',
  },
  link: {
    color: '#1B4332',
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});

export default styles; 