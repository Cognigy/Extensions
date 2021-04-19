const button = theme => ({
  display: 'block',
  width: 215,
  height: 41,
  margin: '0 auto',
  
  backgroundImage: 'url(https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_signin_light.svg)',
  backgroundPosition: 'center center',
  backgroundSize: '100% 100%',
  backgroundColor: 'transparent',
  border: 'none',

  cursor: 'pointer'
})
  
  export const getStyles = theme => {
  
    return {
      buttonStyles: button(theme)
    }
  };