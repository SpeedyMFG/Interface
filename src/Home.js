import React, { useEffect, useState } from 'react';
import './components/Home.css';
import defaultProfilePic from './components/selfi.jpg';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { hasRequiredAbout } from './components/login-form/LoginForm';
import axios from 'axios';

function Home({ user, setUser, setLoggedIn }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [hasSearchPermission] = useState(true);
  const [hasAbouts, setHasAbouts] = useState(false);
  const apiUrl = 'https://localhost:5001/user/authenticate';
  const [successLoginData, setSuccessLoginData] = useState([]);
  const [errorLoginData, setErrorLoginData] = useState([]);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [successLoginStartDate, setSuccessLoginStartDate] = useState(today.toISOString().split('T')[0]);
  const [successLoginEndDate, setSuccessLoginEndDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [errorLoginStartDate, setErrorLoginStartDate] = useState(today.toISOString().split('T')[0]);
  const [errorLoginEndDate, setErrorLoginEndDate] = useState(tomorrow.toISOString().split('T')[0]);
  useEffect(() => {
    // Elasticsearch verilerini çek
    const fetchElasticsearchData = async () => {
      
      try {
        const successLoginResponse = await axios.get('https://localhost:5001/user/successlogin');
        const successLoginHits = successLoginResponse.data?.hits?.hits ?? [];
        const successLoginData = successLoginHits.map((hit) => ({
          ad: hit._source.ad,
          loginTarihi: formatLoginTarihi(hit._source.loginTarihi),
        }));

        console.log("successLoginData içerisindeki değer:", successLoginData);
        setSuccessLoginData(successLoginData);
  
        const errorLoginResponse = await axios.get('https://localhost:5001/user/errorlogin');
        const errorLoginHits = errorLoginResponse.data?.hits?.hits ?? [];
        const errorLoginData = errorLoginHits.map((hit) => ({
          ad: hit._source.ad,
          loginTarihi: formatLoginTarihi(hit._source.loginTarihi),
        }));
        console.log("errorLoginData içerisindeki değer:", errorLoginData);
        setErrorLoginData(errorLoginData);
      } catch (error) {
        console.error('Elasticsearch verileri alınırken bir hata oluştu:', error);
      }
    };
    fetchElasticsearchData();

    const data = { ad: user.name, username: user.sicil };    
    axios.post(apiUrl, data).then((result) => {    
      const { roles } = result.data;
      //console.log('Roles:', JSON.stringify(roles));
      const serializedState = JSON.stringify(result.data);
      localStorage.setItem('myData', serializedState);
      //console.log(result.data);  
      const abouts = hasRequiredAbout(roles);
      setHasAbouts(abouts);
      //console.log("butonu:"+abouts)  
    });
  }, [user.name,user.sicil]);

  const formatLoginTarihi = (loginTarihi) => {
    const date = new Date(loginTarihi);
    const gun = date.getDate();
    const ay = date.getMonth() + 1;
    const yil = date.getFullYear();
    const saat = date.getHours();
    const dakika = date.getMinutes();
    const saniye = date.getSeconds();

    return `${gun}-${ay}-${yil} ${saat}:${dakika}:${saniye}`;
  };

  const data = { ad: user.name, username: user.sicil };

  useEffect(() => {
    axios.post(apiUrl, data)
      .then((result) => {
        const { roles } = result.data;
        //console.log('Roles:', JSON.stringify(roles));
        const serializedState = JSON.stringify(result.data);
        localStorage.setItem('myData', serializedState);
        //console.log(result.data);
        const abouts = hasRequiredAbout(roles);
        setHasAbouts(abouts);
        //console.log("butonu:" + abouts);
      })
      .catch((error) => {
        console.error('Bir hata oluştu:', error);
      });
  }, [user.name, user.sicil, data]);
  
  const handleLogout = () => {
    const rememberMe = localStorage.getItem('rememberMe');
    //console.log(rememberMe);
    if (rememberMe !== 'true') {
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      setUser({ sicil: '', name: '' });
    }
    setLoggedIn(false);
    navigate('/');
  };

  const handleAboutClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const renderSearchIcon = () => {
    if (hasSearchPermission) {
      return <FontAwesomeIcon className="search-icon" icon={faSearch} />;
    }
    return null;
  };
  const filteredSuccessLoginData = successLoginData.filter((row) => {
    if (successLoginStartDate && successLoginEndDate) {
      const loginDate = new Date(row.loginTarihi);
      return (
        loginDate >= new Date(successLoginStartDate) && loginDate <= new Date(successLoginEndDate)
      );
    }
    return true;
  });

  const filteredErrorLoginData = errorLoginData.filter((row) => {
    if (errorLoginStartDate && errorLoginEndDate) {
      const loginDate = new Date(row.loginTarihi);
      return (
        loginDate >= new Date(errorLoginStartDate) && loginDate <= new Date(errorLoginEndDate)
      );
    }
    return true;
  });

  return (
    <>
      <div className="home-header">
        <div className="home-version">
          {hasAbouts && (
            <button className='about' onClick={handleAboutClick}>About</button>
          )}
          <p>Versiyon 1.0.0</p>
        </div>
        <div className="home-user-info">
          <p>{user.sicil}</p>
          <img className="home-profile-pic" src={defaultProfilePic} alt="Profil Resmi" />
        </div>
        <div className="home-logout">
          <button onClick={handleLogout}>Çıkış</button>
        </div>
      </div>
      <div className="home">
        <h1 className="welcome-message">
          Hoş Geldin <br></br>{user.name}
        </h1>
      </div>
      <div className="table-home">
        <div className="table-container">
          <h2>Success Login</h2>
          <div>
            <label htmlFor="successLoginStartDate">Başlangıç Tarihi:</label>
            <input
              type="date"
              id="successLoginStartDate"
              value={successLoginStartDate}
              onChange={(e) => setSuccessLoginStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="successLoginEndDate">Bitiş Tarihi:</label>
            <input
              type="date"
              id="successLoginEndDate"
              value={successLoginEndDate}
              onChange={(e) => setSuccessLoginEndDate(e.target.value)}
            />
          </div>
          <button onClick={() => {
            setSuccessLoginStartDate(null);
            setSuccessLoginEndDate(null);
          }}>Select All</button>
          {filteredSuccessLoginData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Login Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuccessLoginData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.ad}</td>
                    <td>{row.loginTarihi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
          <p>Veriler yükleniyor...</p>
        )}
        </div>

        <div className="table-container">
          <h2>Error Login</h2>
          <div>
            <label htmlFor="errorLoginStartDate">Başlangıç Tarihi:</label>
            <input
              type="date"
              id="errorLoginStartDate"
              value={errorLoginStartDate}
              onChange={(e) => setErrorLoginStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="errorLoginEndDate">Bitiş Tarihi:</label>
            <input
              type="date"
              id="errorLoginEndDate"
              value={errorLoginEndDate}
              onChange={(e) => setErrorLoginEndDate(e.target.value)}
            />
          </div>
          <button onClick={() => {
            setErrorLoginStartDate(null);
            setErrorLoginEndDate(null);
          }}>Select All</button>
          {filteredErrorLoginData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Login Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filteredErrorLoginData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.ad}</td>
                    <td>{row.loginTarihi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
          <p>Veriler yükleniyor...</p>
        )}

        </div>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Versiyon 1.0.0</h2>
            <p>Bu versiyonda şu geliştirmeler yapılmıştır:</p>
            <ul>
              <li>Geliştirme 1</li>
              <li>Geliştirme 2</li>
              <li>Geliştirme 3</li>
            </ul>
            {renderSearchIcon()}
            <button onClick={closePopup}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;