
# Avaya Extension  
  
Integrates Cognigy.AI with Avaya   

 
## Node: Hours 
This node will get office hour operations definition and holiday definitions from Cloud IVR through URL or Id and store result in context variable 
  
- **Connection**: You need to create a Connection. Name is for example 'avaya cloud ivr Connection' or something similar. Now you need some Connection keys:
  
   - Api Key:   Api key to authenticate
      - `key`:  **apiKey**
      - `value`:  Api key from cloud IVR
      
	- Tenant Id : Tenant Id should be as cloud IVR tenant Id. This is not required in case of input is URL.
      - `key`:  **tenantId**
      - `value`:  Cloud IVR tenant Id
      
	- Domain: Domain is base url where resource are stored . This is not required in case of input URL.
      - `key`:  **domain**
      - `value`:  base URL.

- `Holiday URL or Id`: Complete URL or just identifier of Holiday hours of operation
- `Hoop URL or Id`: Complete URL or just identifier of daily hours of operation
- `HolidayContextKey`: _How to store the result in the Cognigy Context. It's a simple name_

	-   Example:  `holiday`
- **HoopsContextKey**: _How to store the result in the Cognigy Context. It's a simple name_

	-   Example:  `hoops`

    
## Node: Prompt  
  
This node will prompt and capture customer’s speech or DTMF inputs. The following arguments can be defined:  
  
- `Type`: there are two prompt options, menu and number.  
  
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
  

- `From`: The optional phone number from which the call is handed over.  
- `Type`: There are two options to handover, phone and sip.  
  
   - **Phone**: Hand over the call conversation to a phone number.  
      - `Destination`: phone number such as +19712209270.  
      - `Callback URL`: REST endpoint that receives call events from CPasS.  
        
   - **Sip**: Hand over the call conversation to sip address.  
      - `Sip Address`: sip address such as `6002151@moon-sbc.bpo.avaya.com` for a vdn destination or `sip:dwang1@sip.linphone.org` for a sip phone.  
      - `Authenticatio Type`: `None` or `Auth`.  
      - Credentials: `username` and `password` of the sip address such as `abc` as username and `xyz` as password.
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
  
This node will send SMS to the destination with the text for voice channel. 
   - `From`: The optional phone number from which the sms message is sent from. 
   - `Text`: the message to be sent to the destination. 
   - `To`: The destination phone number to send the sms to such as `+14252019415`. 

## Node: Conference  
  
This node will join the CPaaS conference room. 
   - `Conference Room`  conference room name such as `AllHandsCall`.

## Node: Hangup  
  
This node will hang up the call.

## Node: Locale  

This node will set the locale language and the voice type on CPaaS so that the intended language and the voice will be spoken to the customers. 
   - `Language`: the lauage to be spoken to the customer such as `English(United States)`. 
   - `Voice`: the man or woman's voice to be spoken to the customer such as `woman`.

## Node: Counter  

This node increment 1 to a value set by the customer when it's hit by the flow runs. This is used to control how many times a path has been run in the flow.  

## Node: Call  

This node will perform a variety of call operations such as make call etc.  
   - **CPaaS Connection**: You need to create a Connection. Name is for example 'My CPaaS Connection' or something similar.  

   - `accountSid`:  account sid of CPaaS account.
   - `token`: auth token of CPaaS account.
   - `domain`: domain of CPaaS REST API such as `api.zang.io`.

   - **Type**: Make call, Interrupt call, Record call, Send audio to call, Send dtmf to call.  
   - **From**: the phone number that the call is made from.  
   - **To**: the phone number or sip address that the call is made to.  
   - **Url**: the url that handles the call interaction once it's connected.  

## Node Pass  

This node controls the number of specified executions on the path.  
   - `Enter maximum number of passes allowed`: maximum number of executions on this path.  
  

## Node Queue  

This node gets the real time information on queue, like: agent available, Agent loggedInn, estimated waiting time, calls in queue.
- **Connection**: You need to create a Connection. Name is for example 'avaya cloud ivr Connection' or something similar. Now you need some Connection keys:
  
   - Api Key:   Api key to authenticate
      - `key`:  **apiKey**
      - `value`:  Api key from cloud IVR
	- Tenant Id : Tenant Id should be as cloud IVR tenant Id. 
	- Domain: Domain is base url where resource are stored .

- `Enter Url`: endpoint to get result  
- `contextKey`: _How to store the result in the Cognigy Context. It's a simple name_
    -   Example:  `queue`
  