import axios from 'axios';
import * as crypto from "crypto-js";
import moment from 'moment-timezone';


function encrypt(text: string): any {
    // generate a random key and IV
    var key = "secret key";
    var cipher = crypto.AES.encrypt(text, key).toString();

    return cipher;
}

  export async function loginRequest(email: string, pwd: string): Promise<any> {
    let url = 'http://192.168.5.28:1880/auth';
    
    const profile = {
        email: email,
        pwd: encrypt(pwd),
        createAt: moment().tz('Europe/Rome').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
    };

    try {
          const response = await axios({
              method: 'post',
              url: url,
              timeout: 4000, // 4 seconds timeout
              data: profile
          });
          return {
            error: false,
            response : response
          }
      } catch (error) {
          return {
            error: true,
            response : error
          }
      }
}
  
export async function loginNodeRed(email: string, pwd: string): Promise<any> {
    const loginResponse = await loginRequest(email, pwd);
    if (loginResponse !== undefined)
        {
            if(loginResponse.error)
                {
                    return {
                        success: false,
                        error: {
                            message: loginResponse.response.message,
                            name: "Login failed",
                        },
                    }
                }
                else
                {
                    if (loginResponse.response.status === 200) {
                        return loginResponse.response.data
                    } else {
                      // Handle login error based on response status
                      return loginResponse.response.data
                    }
                }
            
        }
    else
    {
        console.error("Login failed:", loginResponse);
        return loginResponse
    }
    
    
}

  