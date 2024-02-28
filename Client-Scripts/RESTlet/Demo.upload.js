async function uploadFile(fileData, filename, restletUrl) {
    // Encode file content in Base64
    const base64Data = btoa(fileData);
    
    const formData = { 
      content: base64Data,
      filename: filename 
    };
  
    try {
      const response = await fetch(restletUrl, {
        method: 'POST',
        body: JSON.stringify(formData) 
      });
  
      const jsonResponse = await response.json();
      console.log(jsonResponse); // Log the response from NetSuite 
    } catch (error) {
      console.error("Error uploading file:", error); 
    }
  }
  
  // Example usage - Assuming you have file data in a variable called 'myFile'
  const filename = "example.pdf"; 
  const restletUrl = ""; 
  uploadFile(myFile, filename, restletUrl);