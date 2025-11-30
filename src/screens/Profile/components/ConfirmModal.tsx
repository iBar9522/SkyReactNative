import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  visible: boolean
  title: string
  subtitle?: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}

export default function ConfirmModal({ visible, title, subtitle, onCancel, onConfirm }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {subtitle ? <Text style={styles.modalSubtitle}>{subtitle}</Text> : null}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={onCancel}>
              <Text style={styles.modalButtonSecondaryText}>Нет</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={onConfirm}>
              <Text style={styles.modalButtonPrimaryText}>Да</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: '#1A2233',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Montserrat',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  modalButtonPrimary: {
    backgroundColor: '#FFFFFF',
  },
  modalButtonSecondaryText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    color: '#1B2B4E',
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '600',
  },
})


