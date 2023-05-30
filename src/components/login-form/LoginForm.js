import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../button/Button';
import Form from '../form/Form';
import Input from '../input/Input';
import axios from 'axios';

function hasRequiredRoles(roles) {
  console.log("requrolesss"+roles);
  const requiredRoles = ['CJ_USER', 'CJ_USER_ALL', 'CJ_USER_SEARCH'];  
  return requiredRoles.some(role => roles.includes(role));
}
function hasRequiredAbout(roles) {
  const requiredAbout = ['CJ_USER_SEARCH'];
  return roles.some(role => requiredAbout.includes(role));
}

function LoginForm({ setUser, setLoggedIn }) {
  const [userInput, setUserInput] = useState({
    sicil:  '',
    name:  ''
  });
  const apiUrl = "https://localhost:5001/user/authenticate";   
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://localhost:5001/user/userinfo");
        console.log("redis günlükleri:"+response.data.ad);
        console.log("redis günlükleri:"+response.data.username);
        console.log("redis günlükleri:"+response.data.rememberMe);
        const storedSicil = response.data.username;
        const storedName = response.data.ad;
        const storedRememberMe = response.data.rememberMe;
        const emailInput = document.querySelector('input[type="email"]');
        const nameInput = document.querySelector('input[type="text"]');

        if (storedRememberMe === true) {
          setUserInput({ sicil: storedSicil, name: storedName });
          setRememberMe(true);

          if (emailInput) {
            emailInput.value = storedSicil || '';
          }

          if (nameInput) {
            nameInput.value = storedName || '';
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    if (e.target.type === 'email') {
      setUserInput({ ...userInput, sicil: e.target.value });
    } else if (e.target.type === 'text') {
      setUserInput({ ...userInput, name: e.target.value });
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };
  
  const handleClick = async () => {
    if (userInput.sicil === '') {
      alert('Sicil Adı Boş Geçilemez');
    } else if (userInput.name === '') {
      alert('Kullanıcı Adı Boş Geçilemez');
    } else {
      try {
        const data = { ad: userInput.name, username: userInput.sicil,rememberMe };    
        const result = await axios.post(apiUrl, data);
        const { token, roles } = result.data;
        console.log('Token:', token);
        console.log('Roles:', JSON.stringify(roles));
        const serializedState = JSON.stringify(result.data);
        localStorage.setItem('myData', serializedState);
        console.log(result.data);  
        const hasRequired = hasRequiredRoles(roles);
        const hasAbouts = hasRequiredAbout(roles);
        console.log("About butonu:"+hasAbouts)          
        if (hasRequired) {
          setUser(userInput);
          setLoggedIn(true);
          navigate('/home');
          alert('Giriş Başarılı!');
        } else {
          alert('Giriş yapmak için gerekli izinlere sahip değilsiniz.');
        }
      } catch (error) {
        console.error('Authentication failed', error);
        alert('kullanıcı adı veya sicil numarası yanlış');
      }
    }
  }; 
  

  return (
    <Form>
      <Input
        type={'email'}
        name={'sicil'}
        value={userInput.sicil}
        placeHolder={'Sicil Numarası'}
        onChange={handleChange}
      />
      <Input
        type={'text'}
        name={'name'}
        placeHolder={'Ad Soyad'}
        value={userInput.name}
        onChange={handleChange}
      />
      <div className="remember-me-container">
        <label>
          <input type="checkbox" checked={rememberMe} onChange={handleRememberMeChange} />
          Beni Hatırla
        </label>
      </div>
      <Button onClick={handleClick} />
    </Form>
  );
}
export { hasRequiredAbout };
export default LoginForm;
