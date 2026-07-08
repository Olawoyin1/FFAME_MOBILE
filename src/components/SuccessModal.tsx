import { Modal, View, TouchableOpacity } from 'react-native'
import { Text } from './Text'
import SuccessSvg from '../../assets/icons/Success.svg'

interface Props {
  visible: boolean
  title?: string
  message?: string
  onClose: () => void
}

export default function SuccessModal({
  visible,
  title = 'Application Submitted!',
  message = "Your application has been sent. We'll notify you once it's reviewed.",
  onClose,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={{
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <View style={{
          backgroundColor: '#ffffff', borderRadius: 24,
          paddingHorizontal: 28, paddingTop: 32, paddingBottom: 28,
          alignItems: 'center', width: '100%', maxWidth: 340,
        }}>
          <SuccessSvg width={120} height={120} />

          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
            {title}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
            {message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 24, width: '100%', backgroundColor: '#03397B',
              paddingVertical: 14, borderRadius: 12, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
