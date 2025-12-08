import { gql } from '@apollo/client';

const GET_INSTRUCTORS = gql`
query {
    instructors {
        _id
        first_name
        last_name
        department
        email
        phone
        office
        date_hired
        numOfClassesTaught
        courses {
            _id
            course_name
            department
            credits
        }
    }
}
`;