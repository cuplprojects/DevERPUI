
import React, { useEffect, useState } from 'react'
import API from '../../CustomHooks/MasterApiHooks/api'
import { Select, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { useStore } from 'zustand'
import themeStore from '../../store/themeStore'
import AddNew from './AddNew';
import Import from './Import'

const AddPage = () => {
    const { getCssClasses } = useStore(themeStore)
    const cssClasses = getCssClasses()
    const customDark = cssClasses[0]
    const customMid = cssClasses[1]
    const customLight = cssClasses[2]
    const customBtn = cssClasses[3]
    const customDarkText = cssClasses[4]
    const customLightText = cssClasses[5]
    const customLightBorder = cssClasses[6]
    const customDarkBorder = cssClasses[7]

    const [group, setGroup] = useState([]);
    const [groupId, setGroupId] = useState(null); // Store selected group ID
    const [showform, setshowform] = useState(false);
    const [showImport, setshowImport] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const getGroups = async () => {
            try {
                const response = await API.get('/Groups');
                setGroup(response.data);
            } catch (error) {
                console.error(t('failedtofetchGroup'), error);
            }
        };
        getGroups();
    }, []);

    const handleClick = () => {
        setshowform(!showform)
    }

    const handleClickImport = () => {
        setshowImport(!showImport)
    }

    const handleGroupSelect = (value) => {
        setGroupId(value);
        setshowButtons(true);
    };

    return (
        <div>
            <h6>Select Group</h6>
            <Select
                className="w-25"
                placeholder={t("selectGroup")}
                onChange={handleGroupSelect}
            >
                {group.map((gr) => (
                    <Select.Option key={gr.id} value={gr.id}>
                        {gr.name}
                    </Select.Option>
                ))}
            </Select>
            {groupId && (
            <div className='justify-content-center'>
                <Button onClick={handleClick}>Add New</Button>
                {showform && <AddNew groupId={groupId} />}
                <Button onClick={handleClickImport}> Import</Button>
                {showImport && <Import groupId={groupId}/> }
            </div>
            )}
        </div>
    );
};

export default AddPage;
