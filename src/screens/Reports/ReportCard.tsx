import { StyleSheet, TouchableOpacity, View, Text, Image, ActivityIndicator } from "react-native";
import DownLoadIcon from '@/assets/download.svg'
import DocumentIcon from '@/assets/document.svg'
import { useNavigation } from "@react-navigation/native";
interface ReportCardProps {
  title: string;
  subtitle: string;
  date: string;
  fileSize?: string;
  onDownload?: () => void;
  showArrow?: boolean;
  isLoading?: boolean;
}



const ReportCard = ({ title, subtitle, fileSize, onDownload, date, showArrow, isLoading }: ReportCardProps) => {
  const navigation = useNavigation<any>()
  const onArrowPress = () => {
    if (showArrow) {
      navigation.navigate('ReportsDate')
    } else if (onDownload) {
      onDownload()
    }
  }
  return (
    <TouchableOpacity style={styles.reportCard} activeOpacity={0.7}>
      <View style={styles.reportContent}>
        <View style={styles.reportInfo}>
          {showArrow && <DocumentIcon />}
          <View style={styles.reportText}>
            <View style={styles.titleRow}>
              <Text style={styles.reportTitle}>{title}</Text>
           
            </View>
           
            <View style={styles.subtitleRow}>
              {subtitle && (
              <Text style={styles.reportSubtitle}>{subtitle}</Text>
              )}
              {date && (
              <Text style={styles.reportDate}>{new Date(date).toLocaleDateString()}</Text>
              )}
            </View>
   
          </View>
        
        </View>
         <View>
         
         <TouchableOpacity 
           style={styles.arrowButton} 
           onPress={onArrowPress}
           disabled={isLoading}
         >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <DownLoadIcon/>
            )}
          </TouchableOpacity>
         <Text style={styles.fileSize}>{fileSize}</Text>
         </View>
         
  
      </View>
    </TouchableOpacity>
  );
};
export default ReportCard;
const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  fileSize: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    paddingRight: 4,
  },
  reportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    
  },
  reportInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportText: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtitleRow: {
   
    gap: 5,
    marginTop: 10,
  },
  reportDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Montserrat',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#FAFAFA',
    flex: 1,
  },
  downloadButton: {
    padding: 8,
  },
  arrowButton: {
    padding: 8,
  },
  icon: {
    fontSize: 18,
    color: 'white',
  },
});