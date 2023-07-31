const axios = require("axios");

async function getChatHistory(userId) {
  const accessToken = "sk_test_BpApDeqY7UA6zWRbSRR6SrwzGdEDOE4h";
  const apiUrl = `https://api.talkjs.com/v1/t15249fa/users/${userId}`;
  try {
    const response = await axios({
      method: "get",
      url: apiUrl + "/conversations",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = Object.keys(response.data.data[0].participants);
    return result;
  } catch (error) {
    console.log(error);
  }
}

module.exports = getChatHistory;
