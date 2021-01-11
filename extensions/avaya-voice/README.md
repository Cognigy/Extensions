
# Avaya Extension  
  
Integrates Cognigy.AI with Avaya   
    
## Node: Prompt  
  
This node will capture customer’s speech or DTMF inputs. The following arguments can be defined:  
  
- **Prompt type**: there are two prompt options, menu and number.  
  
   - **Menu**: To get single digit DTMF value from a customer for menu navigations.  
      - `Text`: Prompt text, like press 1 for English…. This argument is optional if prompt is audio file via node Play.
      - `Menu`: Definition between DTMF button and Cognigy intent or input text.  
          - For example:   
              - 1:Sales    
            - 2:Support    
              ....  
        
   - **Number**: To collect number from DTMF button inputs such as credit card. No. 1234 5678 9012 3456  
      - `Text`: Prompt text like Please enter your credit card no. This argument is optional if prompt is audio file via node Play.
      - `Max number of digits`: Expected maximum number of digits.  
  
## Node: Handover  
  
This node will hand over the call conversation to the destination, either as a phone number or as a sip address. The following arguments have to be defined:  
  
- **Handover type**: There are two options to handover, phone and sip.  
  
   - **Phone**: Hand over the call conversation to a phone number.  
      - `Destination`: phone number such as +19712209270.  
      - `Callback URL`: REST endpoint that receives call events from CPasS.  
        
   - **Sip**: Hand over the call conversation to sip address.  
      - `User`: user name of the sip address such as `6002151` for vdn or `sip:dwang1` for personal sip phone.
      - `Domain`: domain for sip address such as `moon-sbc.bpo.avaya.com`.
      - Credential: user name and password of the sip address such as `abc` as username and `xyz` as password.
      - `Callback URL`: REST endpoint that receives call events from CPasS.  
     
## Node: Play  
  
This node will play audio file located at an endpoint url. 
   - `URL`: url of the audi ofile to play such as `https://xyz.com/greeting.wav`. 
   - `Text`: the text of the audio file content such as `Welcome to Avaya`. 

## Node: Record  
  
This node will use a toggle button to enable recording on the conversation flow or not. 
   - `Record?`: the flag of true or false.  
   - `Action Url`: the REST endpoint that receives recording URL from CPasS.
  
## Node: Redirect  
  
This node will redirect current call to the target Cognigy flow without return. 
   - `URL`: url of the target Cognigy flow.

## Node: Sms  
  
This node will sends SMS to the destination with the text for voice channel. 
   - `Text`: the message to be sent to the destination. 
   - `To`: The destination phone number to send the sms to such as `+14252019415`. 

## Node: Conference  
  
This node will join the CPaaS conference room. 
   - `Conference Room`  conference name such as `AllHandsCall`.

## Node: Hangup  
  
This node will hang up the call.

## Node: Locale

This node will set the locale language and the voice type on CPaaS so that the intended language and the voice will be spoken to the customers. 
   - `Language`: the lauage to be spoken to the customer such as `English(United States)`. 
   - `Voice`: the man or woman's voice to be spoken to the customer such as `woman`.