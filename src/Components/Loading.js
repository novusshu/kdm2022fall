import ReactLoading from 'react-loading';

const Loading = ({ type="spokes", color="#FF5733"}) => (
    <div>
        <ReactLoading className="position-absolute start-50 top-50 translate-middle" type={type} color={color} height={'10%'} width={'10%'} />
        <h5 className="position-absolute start-50 top-50 translate-middle">Uploading... Please Wait...</h5>    
    </div>

);

export default Loading