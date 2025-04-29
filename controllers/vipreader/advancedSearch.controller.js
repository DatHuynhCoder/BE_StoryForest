export const AdvancedSearch = async (req, res)=>{
try {
  console.log('advanced search')
  res.send('hello')
} catch (error) {
  console.error("Error in advanced search: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
}
}