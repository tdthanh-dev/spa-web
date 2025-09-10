// Phone validation utility for Vietnamese phone numbers
export const validateVietnamesePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Vui lòng nhập số điện thoại' }
  }

  // Loại bỏ tất cả ký tự không phải số
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Kiểm tra độ dài (10-11 số cho VN)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return { isValid: false, error: 'Số điện thoại phải có 10-11 chữ số' }
  }
  
  // Kiểm tra đầu số hợp lệ của VN
  const validPrefixes = [
    '032', '033', '034', '035', '036', '037', '038', '039', // Viettel
    '070', '076', '077', '078', '079', // Mobifone
    '081', '082', '083', '084', '085', '088', // Vinaphone
    '056', '058', '059', // Vietnamobile
    '090', '093', '089', // Gmobile
    '091', '094', '0123', '0124', '0125', '0127', '0129', // VNPT
    '096', '097', '098', '0162', '0163', '0164', '0165', '0166', '0167', '0168', '0169', // Viettel
    '086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039' // Viettel
  ]
  
  const prefix = cleanPhone.substring(0, 3)
  const prefix4 = cleanPhone.substring(0, 4)
  
  if (!validPrefixes.includes(prefix) && !validPrefixes.includes(prefix4)) {
    return { isValid: false, error: 'Số điện thoại không đúng định dạng Việt Nam' }
  }
  
  return { isValid: true, error: '' }
}

// Phone prefixes for reference
export const PHONE_PREFIXES = {
  VIETTEL: ['032', '033', '034', '035', '036', '037', '038', '039', '096', '097', '098', '0162', '0163', '0164', '0165', '0166', '0167', '0168', '0169'],
  MOBIFONE: ['070', '076', '077', '078', '079'],
  VINAPHONE: ['081', '082', '083', '084', '085', '088'],
  VIETNAMOBILE: ['056', '058', '059'],
  GMOBILE: ['090', '093', '089'],
  VNPT: ['091', '094', '0123', '0124', '0125', '0127', '0129']
}
